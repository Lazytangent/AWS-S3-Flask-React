const SET_USERS = 'users/SET_USERS';

const setUsers = (users) => ({
  type: SET_USERS,
  users,
});

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
    default:
      return state;
  }
};

export default usersReducer;
