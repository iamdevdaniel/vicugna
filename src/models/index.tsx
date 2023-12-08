import { DefaultTheme } from 'react-native-paper'

type ColorShades = '50' | '500' | '900'

type CustomColors = {
    [color in 'blue' | 'green' | 'red' | 'yellow']?: Record<ColorShades, string>
} & typeof DefaultTheme.colors

export type CustomTheme = typeof DefaultTheme & {
    colors: CustomColors
}
