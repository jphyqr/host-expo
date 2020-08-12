import firebase from "../firebase";
import cuid from "cuid";
import { SET_GROUP } from "../constants/reducerConstants";
export const uploadGroupDisplayPhoto = ({ firestore }, groupId, file) => async (
  dispatch
) => {
  const imageName = cuid();

  const path = `${groupId}/group_images`;
  const options = {
    name: imageName,
  };
  try {
    // upload the file to firebase storage
    let uploadedFile = await firebase.uploadFile(path, file, null, options);
    // get url of image
    let downloadURL = await uploadedFile.uploadTaskSnapshot.ref.getDownloadURL();
    // get userdoc
    let groupDoc = await firestore.collection("groups").doc(groupId).update({
      photoURL: downloadURL,
    });
    // check if user has photo, if not update profile

    // add the image to firestore
    await firestore
      .collection("groups")
      .doc(groupId)
      .collection("photos")
      .doc(cuid)
      .set({
        name: imageName,
        url: downloadURL,
      });
  } catch (error) {
    console.log(error);
  }
};

export const uploadPhotoPreGroup = (file) => async (dispatch) => {
  const imageName = cuid();

  const path = `pregroup/group_images`;
  const options = {
    name: imageName,
  };
  try {
    // upload the file to firebase storage
    let uploadedFile = await firebase.uploadFile(path, file, null, options);
    // get url of image
    let downloadURL = await uploadedFile.uploadTaskSnapshot.ref.getDownloadURL();

    return { name: imageName, url: downloadURL };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const inviteMembersToGroup = (
  { firestore },
  inviteList,
  group
) => async (dispatch) => {
  try {
    let uGroup = group;
    let uInvite = group.invited || {};
    for (const member of inviteList) {
      let newGroupMember = {
        groupName: group.name,
        privacy: group.privacy,
        groupId: group.id,
        userUid: member.id,
        userDisplayName: member.displayName,
        groupPhotoURL: group.photoURL,
        userPhotoURL: member.photoURL,
        hostUid: group.hostUid,
        hostedBy: group.hostedBy,
        joinDate: Date.now(),
        host: false,
        area: "REGINA_SK",
        invited: true,
      };

      uInvite[`${member.id}`] = {
        area: "REGINA_SK",
        displayName: member.displayName,
        photoURL: member.photoURL,
      };

      await firestore
        .collection("group_member")
        .doc(`${group.id}_${member.id}`)
        .set(newGroupMember);
    }

    uGroup.invited = uInvite;

    dispatch({ type: SET_GROUP, payload: uGroup });
  } catch (error) {
    console.log(error);
  }
};
