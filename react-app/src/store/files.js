const SET_FILE = "files/SET_FILE";

const setFile = (file) => {
  return {
    type: SET_FILE,
    file,
  };
};

export const uploadFile = (fileForm) => async (dispatch) => {
  const {
    user_id,
    /* all,
       other,
       form,
       fields, */
    file, // this is the file for uploading
  } = fileForm;

  const form = new FormData();
  form.append('user_id', user_id);
  // repeat as necessary for each required form field
  form.append('file', file);

  const res = await fetch('/api/files', {
    method: "POST",
    body: form,
  });

  const uploadedFile = await res.json();
  if (!uploadedFile.errors) {
    dispatch(setFile(uploadedFile));
  }
  return uploadedFile;
};

const initialState = {};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FILE:
      return action.file;
    default:
      return state;
  }
};

export default fileReducer;
