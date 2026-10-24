import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getMission, TRAITOR_BRIEFING } from './missions';
import { STORAGE_KEY } from './storage';
import type { Session } from './types';

const stored = (): Session => JSON.parse(localStorage.getItem(STORAGE_KEY)!);

function setup() {
  const user = userEvent.setup();
  const utils = render(<App passDelayMs={0} />);
  return { user, ...utils };
}

async function addPlayers(user: ReturnType<typeof userEvent.setup>, names: string[]) {
  for (const name of names) {
    await user.type(screen.getByLabelText('Player name'), `${name}{Enter}`);
  }
}

async function startGame(user: ReturnType<typeof userEvent.setup>, names = ['Ana', 'Ben', 'Cal', 'Dee']) {
  await addPlayers(user, names);
  await user.click(screen.getByRole('button', { name: 'Start Game' }));
}

/** Reveals and hides every remaining player, returning what each saw. */
async function dealEveryone(user: ReturnType<typeof userEvent.setup>) {
  const seen: { name: string; traitor: boolean; mission: string }[] = [];
  while (screen.queryByRole('button', { name: 'Reveal My Role' })) {
    const name = screen.getByRole('heading', { level: 1 }).textContent!;
    await user.click(screen.getByRole('button', { name: 'Reveal My Role' }));
    const traitor = screen.queryByText('A Traitor') !== null;
    seen.push({ name, traitor, mission: screen.getByRole('heading', { level: 2 }).textContent! });
    await user.click(screen.getByRole('button', { name: 'Hide & Pass Phone' }));
  }
  return seen;
}

beforeEach(() => localStorage.clear());

describe('setup', () => {
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
  it('shows each player their role privately, one at a time, then completes', async () => {
    const { user } = setup();
    await startGame(user);

    expect(screen.getByText(/Player 1 of 4/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana');
    // No role information before the player taps Reveal.
    expect(screen.queryByText(/Faithful$|A Traitor/)).not.toBeInTheDocument();

    const seen = await dealEveryone(user);
    expect(seen.map((s) => s.name)).toEqual(['Ana', 'Ben', 'Cal', 'Dee']);
    expect(seen.filter((s) => s.traitor)).toHaveLength(1);
    // Everyone, Traitor included, sees the same Faithful mission.
    expect(new Set(seen.map((s) => s.mission)).size).toBe(1);
    expect(getMission(stored().current!.missionId)!.title).toBe(seen[0].mission);

    expect(screen.getByRole('heading', { name: 'Dealing complete' })).toBeInTheDocument();
    expect(screen.queryByText('A Traitor')).not.toBeInTheDocument();
  });

  it('hides the role immediately when the phone is passed', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    await user.click(screen.getByRole('button', { name: 'Reveal My Role' }));
    expect(screen.getByText(/Ana, you are/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hide & Pass Phone' }));
    expect(screen.queryByText(/you are/)).not.toBeInTheDocument();
    expect(screen.queryByText(/mission/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ben');
  });

  it('shows Traitors the Faithful mission and their secret orders', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    const traitorId = stored().current!.traitorIds[0];
    const traitorName = stored().players.find((p) => p.id === traitorId)!.name;
    const mission = getMission(stored().current!.missionId)!;
    for (;;) {
      const name = screen.getByRole('heading', { level: 1 }).textContent;
      await user.click(screen.getByRole('button', { name: 'Reveal My Role' }));
      if (name === traitorName) break;
      expect(screen.queryByText('Your secret orders')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Hide & Pass Phone' }));
    }
    expect(screen.getByText('A Traitor')).toBeInTheDocument();
    expect(screen.getByText('The Faithful mission')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: mission.title })).toBeInTheDocument();
    expect(screen.getByText(mission.description)).toBeInTheDocument();
    expect(screen.getByText('Your secret orders')).toBeInTheDocument();
    expect(screen.getByText(TRAITOR_BRIEFING[0])).toBeInTheDocument();
  });

  it('delays the Reveal button so a double tap cannot expose the next role', async () => {
    const user = userEvent.setup();
    render(<App passDelayMs={10_000} />);
    await addPlayers(user, ['Ana', 'Ben']);
    await user.click(screen.getByRole('button', { name: 'Start Game' }));
    expect(screen.getByRole('button', { name: 'Reveal My Role' })).toBeDisabled();
  });
});

describe('next game and reset', () => {
  it('starts the next round after confirmation, keeping players', async () => {
    const { user } = setup();
    await startGame(user);
    const first = await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'Next Game' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Start round 2?');
    await user.click(within(dialog).getByRole('button', { name: 'Deal new roles' }));

    expect(screen.getByText(/Round 2 · Player 1 of 4/)).toBeInTheDocument();
    const second = await dealEveryone(user);
    expect(second[0].mission).not.toBe(first[0].mission);
    const firstTraitor = first.find((s) => s.traitor)!.name;
    expect(second.find((s) => s.traitor)!.name).not.toBe(firstTraitor);
    expect(stored().completedRounds).toBe(2);
  });

  it('can cancel the next-game confirmation', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'Next Game' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Dealing complete' })).toBeInTheDocument();
  });

  it('resets the session after confirmation', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'Reset session' }));
    await user.click(screen.getByRole('button', { name: 'Reset everything' }));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
    expect(screen.getByText('No players yet.')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns to setup to change players, then deals the next round', async () => {
    const { user } = setup();
    await startGame(user, ['Ana', 'Ben']);
    await dealEveryone(user);
    await user.click(screen.getByRole('button', { name: 'Edit players or Traitors' }));
    await addPlayers(user, ['Cal']);
    await user.click(screen.getByRole('button', { name: 'Start Round 2' }));
    expect(screen.getByText(/Round 2 · Player 1 of 3/)).toBeInTheDocument();
  });
});

describe('persistence', () => {
  it('restores roles, mission and progress after a refresh without re-dealing', async () => {
    const { user, unmount } = setup();
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Reveal My Role' }));
    await user.click(screen.getByRole('button', { name: 'Hide & Pass Phone' }));
    await user.click(screen.getByRole('button', { name: 'Reveal My Role' })); // Ben's card is open
    const before = stored();
    unmount();

    render(<App passDelayMs={0} />);
    // Ben's card is hidden again after the refresh, and it is still Ben's turn.
    expect(screen.queryByText(/you are/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ben');
    expect(screen.getByText(/Player 2 of 4/)).toBeInTheDocument();
    const after = stored();
    expect(after.current!.traitorIds).toEqual(before.current!.traitorIds);
    expect(after.current!.missionId).toBe(before.current!.missionId);
  });

  it('restores a valid saved setup', () => {
    const session: Session = {
      version: 1,
      phase: 'setup',
      players: [
        { id: 'a', name: 'Ana', active: true },
        { id: 'b', name: 'Ben', active: false },
      ],
      traitorCount: 1,
      completedRounds: 3,
      history: { a: { timesTraitor: 2, fairShare: 1.5, roundsPlayed: 3 } },
      previousTraitorIds: ['a'],
      previousMissionId: 'glass-act',
      current: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    render(<App passDelayMs={0} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Sitting out')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Round 4' })).toBeInTheDocument();
  });

  it('shows an error screen for malformed saved data and can start fresh', async () => {
    localStorage.setItem(STORAGE_KEY, '{"version":1,"players":"oops"}');
    const { user } = setup();
    expect(screen.getByText("We couldn't read the saved session")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start a fresh session' }));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
