import {showMessage} from 'react-native-flash-message';

function ShowAlertMessage(message, type, duration = 3000) {
  const colour = type === 'red' || type === 'error' ? 'red' : 'green';
  showMessage({
    message: message,
    type: type === 'success' ? 'success' : type,
    backgroundColor: colour,
    duration: duration,
  });
}

const popTypes = {
  error: 'error',
  info: 'info',
  success: 'success',
};

export {ShowAlertMessage, popTypes};
