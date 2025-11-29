//Part 1: Import Navigation Tools
import React from 'react' //create app components
import { NavigationContainer } from '@react-navigation/native'; //manager that controls what screen is visible
import { createNativeStackNavigator } from '@react-navigation/native-stack'; //create page stack (book - forward/backward between pages )

//Part 2: Importing Screens
import HomeScreen from '../screens/HomeScreen'; 
import ChatScreen from '../screens/ChatScreen';
import FaqScreen from '../screens/FaqScreen';

//Part 3: Create Stack Navigator
const Stack = createNativeStackNavigator(); //controls which screen is currently visible

//Part 4: Define the navigation system
export default function AppNavigator(){ //creates a reusable component that controls navigation
    return (
        <NavigationContainer> 
            <Stack.Navigator initialRouteName="Home"> 
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="FAQ"  component={FaqScreen} />
            </Stack.Navigator>
        </NavigationContainer>

    )
}