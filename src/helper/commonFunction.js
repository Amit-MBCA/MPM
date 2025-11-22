
import {
  loadingOff,
  loadingOn,
} from '../redux/slices/globalSlice';
import {
  Alert,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {width} from '../themes/spacing';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
} from 'react-native-permissions';

let dispatch = null;

export const setDispatch = data => {
  dispatch = data;
};

export const setLoaderOn = () => {
  if (dispatch) {
    dispatch(loadingOn());
  }
};

export const setLoaderOff = () => {
  if (dispatch) {
    dispatch(loadingOff());
  }
};

export const isIOS = Platform.OS === 'ios';


export const topInset =
  initialWindowMetrics?.insets.top < 40
    ? StatusBar.currentHeight + 20
    : initialWindowMetrics?.insets.top || StatusBar.currentHeight + 20;
export const bottomInset = initialWindowMetrics?.insets.bottom || width * 0.13;



let timerId = null;

export const debounce = (callback = () => {}, delay = 300) => {
  let value = false;
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    value = callback();
  }, delay);
  return value;
};

export const onFailure = err => {
};


let photoPermission;

if (Platform.OS === 'ios') {
  cameraPermission = PERMISSIONS.IOS.CAMERA;
  photoPermission = PERMISSIONS.IOS.PHOTO_LIBRARY;
} else {
  cameraPermission = PERMISSIONS.ANDROID.CAMERA;
  photoPermission =
    Platform.Version >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
}

let photoPermissionSuccess = false;



export const checkPhotoLibraryPermission = async () => {
  try {
    const photoResult = await check(photoPermission);
    if (photoResult === RESULTS.UNAVAILABLE) {
    } else if (
      photoResult === RESULTS.DENIED ||
      photoResult == RESULTS.BLOCKED
    ) {
      const photoRequestResult = await request(photoPermission);
      if (
        photoRequestResult === RESULTS.GRANTED ||
        photoRequestResult === RESULTS.LIMITED
      ) {
        photoPermissionSuccess = true;
      } else if (photoRequestResult === RESULTS.BLOCKED) {
        showGalleryPermissionAlert();
        photoPermissionSuccess = false;
      }
    } else if (
      photoResult === RESULTS.GRANTED ||
      photoResult === RESULTS.LIMITED
    ) {
      photoPermissionSuccess = true;
    }
    return photoPermissionSuccess;
  } catch (err) {
  }
};

export const showGalleryPermissionAlert = () => {
  Alert.alert(
    'Gallery Permission Required',
    'Please allow access to your gallery to continue.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => {
          openSettings().catch(() => {
            Alert.alert('Unable to open settings.');
          });
        },
      },
    ],
    {cancelable: true},
  );
};
export const showCameraSettingsAlert = () => {
  Alert.alert(
    'Camera Permission Required',
    'Camera permission is required to take pictures. Please enable it in app settings.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ],
    {cancelable: false},
  );
};


let syncTimeoutId = null;
let isSyncing = false;

export const fakeSyncServer = async (localData, onSuccess, onError) => {
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
    syncTimeoutId = null;
    isSyncing = false;
  }
  
  if (isSyncing) {
    return Promise.resolve(localData);
  }

  isSyncing = true;

  return new Promise((resolve, reject) => {
    syncTimeoutId = setTimeout(() => {
      try {
        const shouldFail = false;
        
        isSyncing = false;
        syncTimeoutId = null;
        
        if (shouldFail) {
          if (onError) onError();
          reject(new Error('Sync failed'));
        } else {
          if (onSuccess) onSuccess(localData);
          resolve(localData);
        }
      } catch (error) {
        isSyncing = false;
        syncTimeoutId = null;
        
        if (onError) onError();
        reject(error);
      }
    }, 1500);
  });
};

export const clearSyncTimeout = () => {
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
    syncTimeoutId = null;
  }
  isSyncing = false;
};