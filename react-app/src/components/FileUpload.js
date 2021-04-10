import { useState } from 'react';
import { useDispatch } from "react-redux";

import { uploadFile } from '../store/files';

const FileUpload = () => {
  const dispatch = useDispatch();

  const [file, setFile] = useState();
  const [errors, setErrors] = useState([]);

  const updateFile = (e) => {
    // This is for a single file upload.
    const file = e.target.files[0];
    if (file) setFile(file);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const fileForm = {
      user_id: user.id,
      file,
    };
    const uploadedFile = await dispatch(uploadFile(fileForm));
    if (!uploadedFile.errors) {
      setErrors(uploadedFile.errors);
    }
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        {errors.length > 0 && (
          <ul>
            {errors.map(error => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
        <input type="file" onChange={updateFile} />
        <button>Upload File</button>
      </form>
    </>
  );
};

export default FileUpload;
