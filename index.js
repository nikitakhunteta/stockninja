/**
 * @format
 */

import { AppRegistry } from 'react-native';
// import { Provider } from 'react-redux'
import App from './App';
import { name as appName } from './app.json';


// const Main =
//     <Provider store={store}>
//         <App />
//     </Provider>
AppRegistry.registerComponent(appName, () => App);
