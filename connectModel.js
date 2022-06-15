import {connect} from "react-redux";

const connectModel = (models, mapStateToProps) => componet => {
    const asyncActions = [];
    const syncActions = [];
    return connect(mapStateToProps)(componet);
}

export default connectModel;