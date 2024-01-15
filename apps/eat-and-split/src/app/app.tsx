import { FC, FormEvent, PropsWithChildren, useState } from 'react';

type Friend = {
  id: string;
  name: string;
  image: string;
  balance: number;
};

const initialFriends: Friend[] = [
  {
    id: '118836',
    name: 'Clark',
    image: 'https://i.pravatar.cc/48?u=118836',
    balance: -7,
  },
  {
    id: '933372',
    name: 'Sarah',
    image: 'https://i.pravatar.cc/48?u=933372',
    balance: 20,
  },
  {
    id: '499476',
    name: 'Anthony',
    image: 'https://i.pravatar.cc/48?u=499476',
    balance: 0,
  },
];

type ButtonProps = {
  onclick?: (...args: unknown[]) => void;
};
const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, onclick }) => {
  return (
    <button onClick={onclick} className="button">
      {children}
    </button>
  );
};

type FriendElementProps = {
  friend: Friend;
  isSelected?: boolean;
  onFriendSelect?: (friend: Friend | null) => void;
};
const FriendElement: FC<FriendElementProps> = ({ friend, isSelected = false, onFriendSelect }) => {
  const handleOnClick = (): void => {
    if (onFriendSelect) {
      onFriendSelect(isSelected ? null : friend);
    }
  };

  return (
    <li className={isSelected ? 'selected' : ''}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>
      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)}
        </p>
      )}
      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you {friend.balance}
        </p>
      )}
      {friend.balance === 0 && <p>You and {friend.name} are even</p>}
      <Button onclick={handleOnClick}>{isSelected ? 'Close' : 'Select'}</Button>
    </li>
  );
};

type FriendListProps = {
  friends: Friend[];
  selectedFriendId?: string;
  onFriendSelect?: (friend: Friend | null) => void;
};
const FriendList: FC<FriendListProps> = ({ friends, selectedFriendId, onFriendSelect }) => {
  return (
    <ul>
      {friends.map((friend) => (
        <FriendElement
          key={friend.id}
          friend={friend}
          isSelected={selectedFriendId === friend.id}
          onFriendSelect={onFriendSelect}
        />
      ))}
    </ul>
  );
};

type FormAddFriendProps = {
  onAddFriend?: (friend: Friend) => void;
};
const FormAddFriend: FC<FormAddFriendProps> = ({ onAddFriend }) => {
  const [name, setName] = useState<string>('');
  const [imgUrl, setImgUrl] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name || !imgUrl) return;

    const newFriend: Friend = {
      name,
      image: imgUrl,
      id: crypto.randomUUID(),
      balance: 0,
    };

    if (onAddFriend) onAddFriend(newFriend);

    setName('');
    setImgUrl('');
  };

  return (
    <form className="form-add-friend" onSubmit={handleFormSubmit}>
      <label>
        <span role="img" aria-hidden>
          🧑🏻‍🤝‍🧑🏼
        </span>{' '}
        Friend name
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} type="text" />

      <label>
        <span role="img" aria-hidden>
          🌄
        </span>{' '}
        Image URL
      </label>
      <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} type="text" />

      <Button>Add</Button>
    </form>
  );
};

type FormSplitBillProps = {
  selectedFriend: Friend;
  onSplitBill: (updatedFriend: Friend) => void;
};
const FormSplitBill: FC<FormSplitBillProps> = ({ selectedFriend, onSplitBill }) => {
  const [bill, setBill] = useState<number>(0);
  const [yourExpense, setYourExpense] = useState<number>(0);
  const [paidBy, setPaidBy] = useState<'user' | 'friend'>('user');
  const friendExpense = bill - yourExpense;

  const onSplitBillSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSplitBill({
      ...selectedFriend,
      balance:
        paidBy === 'user'
          ? selectedFriend.balance + friendExpense
          : selectedFriend.balance - yourExpense,
    });
  };

  return (
    <form className="form-split-bill" onSubmit={onSplitBillSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>
        <span role="img" aria-hidden>
          💵
        </span>{' '}
        Bill value
      </label>
      <input value={bill} onChange={(e) => setBill(Number(e.target.value))} type="number" />

      <label>
        <span role="img" aria-hidden>
          🧑
        </span>{' '}
        Your expense
      </label>
      <input
        value={yourExpense}
        onChange={(e) =>
          setYourExpense(Number(e.target.value) > bill ? bill : Number(e.target.value))
        }
        type="number"
      />

      <label>
        {' '}
        <span role="img" aria-hidden>
          🧑🏻‍🤝‍🧑🏿
        </span>{' '}
        {selectedFriend.name}'s expense
      </label>
      <input value={friendExpense} type="number" disabled />

      <label>
        <span role="img" aria-hidden>
          🤑
        </span>{' '}
        Who is paying the bill
      </label>
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value as 'user' | 'friend')}>
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      <Button>Split bill</Button>
    </form>
  );
};

export const App: FC = () => {
  const [showAddFriend, setShowAddFriend] = useState<boolean>(true);
  const [friendsList, setFriendsList] = useState<Friend[]>(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState<null | Friend>(null);

  const handleShowAddFriend = (): void => {
    setShowAddFriend(!showAddFriend);
  };

  const onAddFriend = (friend: Friend): void => {
    setFriendsList((old) => [...old, friend]);
    setShowAddFriend(false);
  };

  const onFriendSelect = (friend: Friend | null): void => {
    setSelectedFriend(friend);
    setShowAddFriend(false);
  };

  const onSplitBill = (updatedFriend: Friend): void => {
    setFriendsList((old) =>
      old.map((friend) => (friend.id === updatedFriend.id ? updatedFriend : friend))
    );
    setSelectedFriend(null);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <FriendList
          friends={friendsList}
          selectedFriendId={selectedFriend?.id}
          onFriendSelect={onFriendSelect}
        />
        {showAddFriend && <FormAddFriend onAddFriend={onAddFriend} />}
        <Button onclick={handleShowAddFriend}>{showAddFriend ? 'Close' : 'Add friend'}</Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          onSplitBill={onSplitBill}
          key={selectedFriend.id}
          selectedFriend={selectedFriend}
        />
      )}
    </div>
  );
};

export default App;
