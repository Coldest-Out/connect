import React, { Component } from "react";
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { View, StyleSheet, InputToolbar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NetInfo from '@react-native-community/netinfo';
import MapView from "react-native-maps";
import CustomActions from './CustomActions';

//Firestore Database
const firebase = require('firebase');
require('firebase/firestore');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDznwjyCFdKxqqU3b4TLtmFlaRIYTGTpNw",
	authDomain: "chat-app-63550.firebaseapp.com",
	projectId: "chat-app-63550",
	storageBucket: "chat-app-63550.appspot.com",
	messagingSenderId: "570154981638",
	appId: "1:570154981638:web:91b6b16cd976ff3f046687",
};


class Chat extends Component {
	constructor() {
		super();
		this.state = {
			messages: [],
			uid: 0,
			user: {
				_id: '',
				name: '',
				avatar: '',
				image: null,
				location: null,
			},
			isConnected: false
		}

		// initializes the Firestore app
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
		}
		//Stores and retrieves the chat messages users send
		this.referenceChatMessages = firebase.firestore().collection("messages");

		this.referenceMessagesUser = null;
	}

	// Gets messages that are stored in the storage.
	async getMessages() {
		let messages = '';
		try {
			messages = await AsyncStorage.getItem('messages') || [];
			this.setState({
				messages: JSON.parse(messages)
			});
		} catch (error) {
			console.log(error.messages);
		}
	};

	componentDidMount() {
		this.getMessages();

		let { name } = this.props.route.params;
		this.props.navigation.setOptions({ title: name });

		// Reference to load messages via Firebase
		this.referenceChatMessages = firebase.firestore().collection("messages");

		// Checks to see if the user is online or offline
		NetInfo.fetch().then(connection => {
			if (connection.isConnected) {
				this.setState({ isConnected: true });
				console.log('offline');
			} else {
				console.log('offline');
			}
		});

		// Authenticates user via Firebase
		this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				firebase.auth().signInAnonymously();
			}
			this.setState({
				uid: user.uid,
				messages: [],
				user: {
					_id: user.uid,
					name: name,
					avatar: "https://placeimg.com/140/140/any",
				},
			});
			this.referenceMessagesUser = firebase
				.firestore()
				.collection("messages")
				.where("uid", '==', this.state.uid);

			this.saveMessages();
			this.unsubscribe = this.referenceChatMessages
				.orderBy("createdAt", "desc")
				.onSnapshot(this.onCollectionUpdate);
		});
	}

	// stop listening to auth and collection changes
	componentWillUnmount() {
		this.authUnsubscribe();
		this.unsubscribe();
	}

	// Adds messages to cloud storage
	addMessages() {
		const message = this.state.messages[0];
		this.referenceChatMessages.add({
			uid: this.state.uid,
			_id: message._id,
			text: message.text || "",
			createdAt: message.createdAt,
			user: message.user,
			image: message.image || null,
			location: message.location || null,
		});
	}

	onSend(messages = []) {
		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}), () => {
			this.addMessages();
			this.saveMessages();
		});
	}

	// Save stored messages
	async saveMessages() {
		try {
			await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
		} catch (error) {
			console.log(error.message);
		}
	}

	// Delete stored messages
	async deleteMessages() {
		try {
			await AsyncStorage.removeItem('messages');
			this.setState({
				messages: []
			})
		} catch (error) {
			console.log(error.message);
		}
	}

	onCollectionUpdate = (querySnapshot) => {
		const messages = [];
		// go through each document
		querySnapshot.forEach((doc) => {
			// get the QueryDocumentSnapshot's data
			let data = doc.data();
			messages.push({
				_id: data._id,
				text: data.text,
				createdAt: data.createdAt.toDate(),
				user: {
					_id: data.user._id,
					name: data.user.name,
					avatar: data.user.avatar
				},
				images: data.image || null,
				location: data.location || null,
			});
		});
		this.setState({
			messages: messages
		});
	}

	// Disables the ability to compose messages while offline
	renderInputToolbar(props) {
		if (this.state.isConnected == false) {
		} else {
			return (
				<InputToolbar
					{...props}
				/>
			);
		}
	}

	// Customize the color of the sender bubble
	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: '#000'
					}
				}}
			/>
		)
	}

	// Creation of circle button
	renderCustomActions = (props) => {
		return <CustomActions {...props} />;
	};

	// Renders the map location view
	renderCustomView(props) {
		const { currentMessage } = props;
		if (currentMessage.location) {
			return (
				<MapView
					style={{
						width: 150,
						height: 100,
						borderRadius: 13,
						margin: 3
					}}
					region={{
						latitude: currentMessage.location.latitude,
						longitude: currentMessage.location.latitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				/>
			);
		}
		return null;
	}

	render() {
		let { color, name } = this.props.route.params;
		return (
			<View style={[{ backgroundColor: color }, styles.container]}>
				<GiftedChat
					renderBubble={this.renderBubble.bind(this)}
					messages={this.state.messages}
					onSend={(messages) => this.onSend(messages)}
					renderActions={this.renderCustomActions}
					renderCustomView={this.renderCustomView}
					user={{
						_id: this.state.user._id,
						name: name,
						avatar: this.state.user.avatar

					}}
				/>
				{/* Avoid keyboard to overlap text messages on older Andriod versions  */}
				{Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

export default Chat;