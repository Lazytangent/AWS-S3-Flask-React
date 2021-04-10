import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { uploadFile } from '../store/files';

const UploadFile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const uploadedFile = useSelector((state) => state.file);

  const [file, setFile] = useState();

  const updateFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fileForm = {
      user_id: user.id,
      file
    };
    dispatch(uploadFile(fileForm));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={updateFile}
        />
        <button type="submit">Upload</button>
      </form>
      {uploadFile && <img src={uploadedFile.url} alt={uploadedFile.user_id} />}
    </>
  );
};

export default UploadFile;
