import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
//Importing Gifted Chat library for Chat UI
import { GiftedChat, Bubble } from 'react-native-gifted-chat';


export default function Chat(props) {
	let { name, color } = props.route.params;
	const [messages, setMessages] = useState([]);

	// Set the screen title to the user name entered in the start screen
	useEffect(() => {
		props.navigation.setOptions({ title: name });
		setMessages([
			{
				_id: 1,
				text: 'Hello developer',
				createdAt: new Date(),
				user: {
					_id: 2,
					name: 'React Native',
					avatar: 'https://placeimg.com/140/140/any',
				},
			},
			{
				_id: 2,
				text: `${name} has entered the chat.`,
				createdAt: new Date(),
				system: true,
				// Any additional custom parameters are passed through
			},
		]);
	}, [])

	const onSend = useCallback((messages = []) => {
		setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
	}, [])

	const renderBubble = (props) => {
		return (
			<Bubble
				{...props}
				wrapperStyle={{ right: { backgroundColor: '#000' } }}
			/>
		)
	}

	return (
		<View style={[{ backgroundColor: color }, styles.container]}>
			<GiftedChat>
				renderBubble={renderBubble.bind()}
				messages={messages}
				onSend={messages => onSend(messages)}
				user={{ _id: 1 }}
			</GiftedChat>

			{/* Avoid Android Keyboards from overlapping the chat bubbles on older devices */}
			{Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})