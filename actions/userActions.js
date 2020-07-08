import firebase from "../firebase";
import cuid from "cuid";
export const uploadUserDisplayPhoto = (file) => async (dispatch, getState) => {
  const state = getState();
  const userUid = state.firebase.auth.uid;
  const firestore = firebase.firestore();
  const imageName = cuid();

  const path = `user/${userUid}/displayPhotos`;
  const options = {
    name: imageName,
  };
  try {
    // upload the file to firebase storage
    let uploadedFile = await firebase.uploadFile(path, file, null, options);
    // get url of image
    let downloadURL = await uploadedFile.uploadTaskSnapshot.ref.getDownloadURL();

    await firestore
      .collection("users")
      .doc(userUid)
      .collection("user_photos")
      .add({
        url: downloadURL,
        creationDate: Date.now(),
      });
    console.log({ downloadURL });
    return { url: downloadURL };
  } catch (error) {
    console.log(error);
    return error;
  }
};
