import { Datepicker, DatepickerProps } from '@ui-kitten/components'
import { isEqual } from 'lodash'
import React from 'react'

type CustomDatepickerProps = DatepickerProps

const CustomDatepicker: React.FC<CustomDatepickerProps> = ({ ...props }) => (
    <Datepicker {...props} />
)

const arePropsEqual = (
    prevProps: CustomDatepickerProps,
    nextProps: CustomDatepickerProps,
): boolean => isEqual(prevProps, nextProps)

export default React.memo(CustomDatepicker, arePropsEqual)
