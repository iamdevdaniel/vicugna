import React from "react";
import { PaperSelect } from "react-native-paper-select";
import { PaperSelectProps } from "react-native-paper-select/lib/typescript/interface/paperSelect.interface";

interface ExtendedSelectProps extends PaperSelectProps {

}

const ExtendedSelect: React.FC<ExtendedSelectProps> = (props) => {

    return <PaperSelect {...props} />
}

export default ExtendedSelect;