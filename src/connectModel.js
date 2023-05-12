import {connect} from 'react-redux';

const connectModel = (models, mapStateToProps) => Cmp => {
    const mapDispatchToProps = (dispatch) => {
        const props = {};
        models.forEach(model => {
            model.forEach(item => {
                Object.keys(item).forEach(key => {
                    props[key] = (...rest) => {
                        dispatch(item[key](...rest));
                    };
                });
            });
        });
        return props;
    };
    return connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(Cmp);
};

export default connectModel;