const SET_USERS = 'users/SET_USERS';
const SET_USER = 'users/SET_USER';

const setUsers = (users) => ({
  type: SET_USERS,
  users,
});

const setUser = (user) => ({
  type: SET_USER,
  user,
});

export const getUser = (id) => async (dispatch) => {
  const res = await fetch(`/api/users/${id}`);
  const user = await res.json();
  dispatch(setUser(user));
};

export const getUsers = () => async (dispatch) => {
  const res = await fetch('/api/users');
  const data = await res.json();
  dispatch(setUsers(data.users));
};

const initialState = {};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERS:
      return { ...Object.fromEntries(action.users.map((user) => [user.id, user])) };
    case SET_USER:
      return { ...state, [action.user.id]: user };
    default:
      return state;
  }
};

export default usersReducer;
