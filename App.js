// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// import react native gesture handler
import 'react-native-gesture-handler';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Create the navigator
const Stack = createStackNavigator();

import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

export default class HelloWorld extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Start'>
          <Stack.Screen name='Start' component={Start} />
          <Stack.Screen name='Chat' component={Chat} />
        </Stack.Navigator>

      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
})
