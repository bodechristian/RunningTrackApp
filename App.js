import PageRun from './pages/PageRun';
import Times from './pages/Times';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(new Date().toString().slice(0,24), jsonValue)
    } catch (e) {
      // saving error
    }
  }
  
  const getDataLast = async () => {
    try {
      const value = await AsyncStorage.getAllKeys().then((promise) => AsyncStorage.getItem(promise[promise.length-1]));
      if(value !== null) {
        // value previously stored
        console.log(value);
      }
    } catch(e) {
      // error reading value
    }
  }

  function handleTimes(sessionTimes) {
    storeData(sessionTimes);
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Run"> 
          {() => <PageRun handleEnd={handleTimes} getter={getDataLast}/>}
        </Tab.Screen>
        <Tab.Screen name="Times" component={Times}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;