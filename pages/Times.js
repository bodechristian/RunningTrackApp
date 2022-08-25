import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity } from 'react-native';

function Times({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Run')}>
            <Text>
                To Run
            </Text>
        </TouchableOpacity>
      </View>
    );
  }

const styles = StyleSheet.create({

});

export default Times;