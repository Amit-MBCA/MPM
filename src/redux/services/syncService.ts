import {Project} from '../slices/projectsSlice';
import {fakeSyncServer, clearSyncTimeout} from '../../helper/commonFunction';
import {setLoaderOn, setLoaderOff} from '../../helper/commonFunction';
import {ShowAlertMessage, popTypes} from '../../helper/showAlertMessage';
import {ValidationConstants} from '../../utils/validationConstants';
import {AppConstants} from '../../utils/appConstants';

export const syncOnAppOpen = async (
  localData: Project[],
  onSuccess?: (data: Project[]) => void,
  onError?: () => void,
): Promise<void> => {
  setLoaderOn();
  try {
    await fakeSyncServer(
      localData,
      (data: Project[]) => {
        setLoaderOff();
        if (onSuccess) onSuccess(data);
      },
      () => {
        setLoaderOff();
        ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
        if (onError) onError();
      },
    );
  } catch (error) {
    setLoaderOff();
    ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
    if (onError) onError();
  }
};

export const syncOnProjectSwitch = async (
  localData: Project[],
  onSuccess?: (data: Project[]) => void,
  onError?: () => void,
): Promise<void> => {
  setLoaderOn();
  try {
    await fakeSyncServer(
      localData,
      (data: Project[]) => {
        setLoaderOff();
        ShowAlertMessage(AppConstants.projects.projectSynced, popTypes.success);
        if (onSuccess) onSuccess(data);
      },
      () => {
        setLoaderOff();
        ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
        if (onError) onError();
      },
    );
  } catch (error) {
    setLoaderOff();
    ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
    if (onError) onError();
  }
};

export const syncOnTaskUpdate = async (
  localData: Project[],
  onSuccess?: (data: Project[]) => void,
  onError?: () => void,
): Promise<void> => {
  clearSyncTimeout();
  
  setLoaderOn();
  try {
    await fakeSyncServer(
      localData,
      (data: Project[]) => {
        setLoaderOff();
        ShowAlertMessage(AppConstants.tasks.taskUpdated, popTypes.success);
        if (onSuccess) {
          onSuccess(data);
        }
      },
      () => {
        setLoaderOff();
        ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
        if (onError) {
          onError();
        }
      },
    );
  } catch (error) {
    setLoaderOff();
    ShowAlertMessage(ValidationConstants.internetCheck, popTypes.error);
    if (onError) {
      onError();
    }
  }
};

