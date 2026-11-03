/* global jest */
jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('expo-secure-store', () => ({getItemAsync:jest.fn().mockResolvedValue(null),setItemAsync:jest.fn().mockResolvedValue(undefined)}));
