import { DefaultTheme } from 'react-native-paper'
import { CustomTheme } from 'src/models'

const customTheme: CustomTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        blue: {
            '50': '#ffc4d5',
            '500': '#317ccc',
            '900': '#07284a',
        },
        green: {
            '50': '#a5f2ab',
            '500': '#44b84d',
            '900': '#102612',
        },
        red: {
            '50': '#ffdee7',
            '500': '#BA261E',
            '900': '#5c0000',
        },
        yellow: {
            '50': '#fff07a',
            '500': '#f2cf22',
            '900': '#4d4108',
        },
    },
}

export default customTheme
