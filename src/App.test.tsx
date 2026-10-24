import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getFaithfulMission, getTraitorMission } from './missions';
import { STORAGE_KEY } from './storage';
import type { Session } from './types';

type User = ReturnType<typeof userEvent.setup>;

const stored = (): Session => JSON.parse(localStorage.getItem(STORAGE_KEY)!);
const holdButton = () => screen.getByRole('button', { name: 'Hold to view' });
const card = () => screen.queryByRole('dialog', { name: 'Your role' });

function setup() {
  const user = userEvent.setup();
  const utils = render(<App passDelayMs={0} />);
  return { user, ...utils };
}

async function addPlayers(user: User, names: string[]) {
  for (const name of names) {
    await user.type(screen.getByLabelText('Player name'), `${name}{Enter}`);
  }
}

async function startGame(user: User, names = ['Ana', 'Ben', 'Cal', 'Dee']) {
  await addPlayers(user, names);
  await user.click(screen.getByRole('button', { name: 'Start Game' }));
}

/** Presses and holds, reads the card, then lets go. */
function hold(): { text: string; traitor: boolean } {
  fireEvent.pointerDown(holdButton());
  const text = card()!.textContent!;
  const traitor = within(card()!).getByRole('heading', { level: 2 }).textContent === 'Traitor';
  fireEvent.pointerUp(holdButton());
  return { text, traitor };
}
const holdAndRead = () => hold().text;

/** Every remaining player holds to view and passes on. */
async function dealEveryone(user: User) {
  const seen: { name: string; text: string; traitor: boolean }[] = [];
  while (screen.queryByRole('button', { name: 'Hold to view' })) {
    const name = screen.getByRole('heading', { level: 1 }).textContent!;
    seen.push({ name, ...hold() });
    await user.click(screen.getByRole('button', { name: /^Done/ }));
  }
  return seen;
}

beforeEach(() => localStorage.clear());

describe('setup', () => {
  it('explains how to play', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'How it works' }));
    expect(screen.getByRole('dialog', { name: 'How it works' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requires two players and blocks duplicate names', async () => {
    const { user } = setup();
    const start = screen.getByRole('button', { name: 'Start Game' });
    expect(start).toBeDisabled();
    await addPlayers(user, ['Ana']);
    expect(screen.getByText('Add at least two players.')).toBeInTheDocument();
    await addPlayers(user, [' ANA ']);
    expect(screen.getByText('ANA is already playing.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Player name'));
    await addPlayers(user, ['Ben']);
    expect(start).toBeEnabled();
  });

  it('edits and removes players', async () => {
    const { user } = setup();
    await addPlayers(user, ['Ana', 'Ben']);
    await user.click(screen.getByRole('button', { name: 'Edit Ana' }));
    const input = screen.getByLabelText('Edit name for Ana');
    await user.clear(input);
    await user.type(input, 'Anna{Enter}');
    expect(screen.getByText('Anna')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Ben' }));
    expect(screen.queryByText('Ben')).not.toBeInTheDocument();
  });

  it('keeps at least one Faithful', async () => {
    const { user } = setup();
    await addPlayers(user, ['Ana', 'Ben', 'Cal']);
    const more = screen.getByRole('button', { name: 'More Traitors' });
    await user.click(more);
    expect(screen.getByLabelText('Number of Traitors')).toHaveTextContent('2');
    expect(more).toBeDisabled();
  });
});

describe('dealing', () => {
  it('shows the card only while held, then passes to each player in turn', async () => {
    const { user } = setup();
    await startGame(user);
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana');
    expect(card()).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Done/ })).not.toBeInTheDocument();

    fireEvent.pointerDown(holdButton());
    expect(card()).toBeInTheDocument();
    // Moving the finger around (even off the button) keeps the card up.
    fireEvent.pointerMove(document.body, { clientX: 10, clientY: 500 });
    fireEvent.pointerLeave(holdButton());
    expect(card()).toBeInTheDocument();
    fireEvent.pointerUp(document.body);
    expect(card()).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Done — pass to Ben' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ben');
    expect(card()).not.toBeInTheDocument();

    const seen = await dealEveryone(user);
    expect(seen.map((s) => s.name)).toEqual(['Ben', 'Cal', 'Dee']);
    expect(screen.getByRole('heading', { name: "Everyone's in. Go play." })).toBeInTheDocument();
  });

  it('gives Faithful their mission and Traitors a different one', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben', 'Cal', 'Dee', 'Eli', 'Fay']);
    const { faithfulMissionId, traitorMissionId } = stored().current!;
    const faithful = getFaithfulMission(faithfulMissionId)!;
    const traitor = getTraitorMission(traitorMissionId)!;
    const seen = await dealEveryone(user);

    const traitors = seen.filter((s) => s.traitor);
    expect(traitors).toHaveLength(1);
    for (const s of seen) {
      if (s.traitor) {
        expect(s.text).toContain(traitor.text);
        expect(s.text).not.toContain(faithful.title);
        expect(s.text).toContain('You are the only Traitor');
      } else {
        expect(s.text).toContain(faithful.text);
        expect(s.text).not.toContain(traitor.title);
      }
    }
  });

  it('tells Traitors who their fellow Traitors are', async () => {
    const { user } = setup();
    await addPlayers(user, ['Ana', 'Ben', 'Cal', 'Dee', 'Eli']);
    await user.click(screen.getByRole('button', { name: 'More Traitors' }));
    await user.click(screen.getByRole('button', { name: 'Start Game' }));
    const seen = await dealEveryone(user);
    const [a, b] = seen.filter((s) => s.traitor);
    expect(a.text).toContain(`Fellow Traitor: ${b.name}`);
    expect(b.text).toContain(`Fellow Traitor: ${a.name}`);
    expect(a.text).toContain('one of you pulling it off is enough');
  });

  it('can go back to the previous player', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben', 'Cal']);
    holdAndRead();
    await user.click(screen.getByRole('button', { name: 'Done — pass to Ben' }));
    await user.click(screen.getByRole('button', { name: '‹ Back to Ana' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana');
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('ignores holds until the pass delay has passed', async () => {
    const user = userEvent.setup();
    render(<App passDelayMs={10_000} />);
    await addPlayers(user, ['Ana', 'Ben']);
    await user.click(screen.getByRole('button', { name: 'Start Game' }));
    expect(holdButton()).toBeDisabled();
    fireEvent.pointerDown(holdButton());
    expect(card()).not.toBeInTheDocument();
  });
});

describe('playing and reveal', () => {
  it('lets a player re-check their role once everyone is in', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben', 'Cal']);
    const seen = await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'Check my role' }));
    await user.click(screen.getByRole('button', { name: 'Cal' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cal');
    expect(holdAndRead()).toBe(seen[2].text);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('heading', { name: "Everyone's in. Go play." })).toBeInTheDocument();
  });

  it('reveals both missions and the Traitors at the end of the round', async () => {
    const { user } = setup();
    await startGame(user);
    const seen = await dealEveryone(user);
    const { faithfulMissionId, traitorMissionId } = stored().current!;
    await user.click(screen.getByRole('button', { name: 'End round & reveal' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('agree out loud on one suspect');
    await user.click(within(dialog).getByRole('button', { name: 'Reveal' }));

    // Revealed in stages for suspense.
    expect(screen.getByText('The moment of truth')).toBeInTheDocument();
    expect(screen.queryByText(getFaithfulMission(faithfulMissionId)!.text)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reveal the Faithful mission' }));
    expect(screen.getByText(getFaithfulMission(faithfulMissionId)!.text)).toBeInTheDocument();
    expect(screen.queryByText(getTraitorMission(traitorMissionId)!.text)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reveal the Traitor' }));
    expect(screen.getByText(new RegExp(getTraitorMission(traitorMissionId)!.text))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: seen.find((s) => s.traitor)!.name })).toBeInTheDocument();
    expect(screen.getByText('Who won?')).toBeInTheDocument();
    expect(stored().phase).toBe('revealed');
  });

  it('starts the next round after confirmation, keeping players', async () => {
    const { user } = setup();
    await startGame(user);
    const first = await dealEveryone(user);
    const firstMission = stored().current!.faithfulMissionId;
    await user.click(screen.getByRole('button', { name: 'End round & reveal' }));
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    await user.click(screen.getByRole('button', { name: 'Reveal the Faithful mission' }));
    await user.click(screen.getByRole('button', { name: 'Reveal the Traitor' }));
    await user.click(screen.getByRole('button', { name: 'Next Game' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Deal' }));

    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    expect(stored().current!.faithfulMissionId).not.toBe(firstMission);
    const second = await dealEveryone(user);
    expect(second.find((s) => s.traitor)!.name).not.toBe(first.find((s) => s.traitor)!.name);
    expect(stored().completedRounds).toBe(2);
  });

  it('resets the session after confirmation', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'End round & reveal' }));
    await user.click(screen.getByRole('button', { name: 'Reveal' }));
    await user.click(screen.getByRole('button', { name: 'Reveal the Faithful mission' }));
    await user.click(screen.getByRole('button', { name: 'Reveal the Traitor' }));
    await user.click(screen.getByRole('button', { name: 'Edit players' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('persistence', () => {
  it('restores roles, missions and progress after a refresh without re-dealing', async () => {
    const { user, unmount } = setup();
    await startGame(user);
    holdAndRead();
    await user.click(screen.getByRole('button', { name: /^Done/ }));
    fireEvent.pointerDown(holdButton()); // Ben is mid-hold when the page reloads
    const before = stored();
    unmount();

    render(<App passDelayMs={0} />);
    expect(card()).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ben');
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
    const after = stored();
    expect(after.current!.traitorIds).toEqual(before.current!.traitorIds);
    expect(after.current!.faithfulMissionId).toBe(before.current!.faithfulMissionId);
    expect(after.current!.traitorMissionId).toBe(before.current!.traitorMissionId);
  });

  it('restores a valid saved setup', () => {
    const session: Session = {
      version: 4,
      phase: 'setup',
      players: [
        { id: 'a', name: 'Ana' },
        { id: 'b', name: 'Ben' },
      ],
      traitorCount: 1,
      completedRounds: 3,
      history: { ana: { timesTraitor: 2, fairShare: 1.5, roundsPlayed: 3 } },
      previousTraitors: ['ana'],
      previousFaithfulMissionId: 'lob-lover',
      previousTraitorMissionId: 'commentator',
      current: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    render(<App passDelayMs={0} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Ben')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Next Game' })).toBeInTheDocument();
  });

  it('shows an error screen for malformed saved data and can start fresh', async () => {
    localStorage.setItem(STORAGE_KEY, '{"version":4,"players":"oops"}');
    const { user } = setup();
    expect(screen.getByText("Saved game couldn't be loaded")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start fresh' }));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
