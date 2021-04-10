import { useEffect, } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from "react-router-dom";

import { getUsers } from '../store/users';

function UsersList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => Object.values(state.users));

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const userComponents = users.map((user) => {
    return (
      <li key={user.id}>
        <NavLink to={`/users/${user.id}`}>{user.username}</NavLink>
      </li>
    );
  });

  return (
    <>
      <h1>User List: </h1>
      <ul>{userComponents}</ul>
    </>
  );
}

export default UsersList;
