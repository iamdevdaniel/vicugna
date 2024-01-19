import { StyleSheet, View } from 'react-native';
import TestView from './src/views/TestView';

export default function App() {
  return (
    <View style={styles.container}>
      <TestView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
