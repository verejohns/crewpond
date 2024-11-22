import React, { Component } from "react";
import { Modal, ModalBody} from 'reactstrap';
import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import PropTypes from "prop-types";
import { Select } from "../../../components";

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
     })
}

class SkillSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            categoryOptions: [],
            isOpen: false
        };
        this.selectCategory = this.selectCategory.bind(this);
    }
    componentDidMount() {
        const { getCategories } = this.props;

        // getCategories()
        // .then(({result:{data}}) => {
        //     const { categories } = data;
        //     let options = []
        //     if(categories.length > 0){
        //         categories.filter(item=>item.deep === 1).map((category) => {
        //             let option = {
        //                 label: category.main,
        //                 options: [],
        //             };
        //             const subCategories = category.sub;
        //             const middleSubs = category.sub.filter((el) => categories.find((e) => e.main === el));
        //             if (middleSubs.length > 0) {
        //                 options.push({
        //                     label: category.main,
        //                     options: [{ label: null, value: null }],
        //                 });
        //                 for (let i = 0; i < subCategories.length; i += 1) {
        //                     const subCategory = categories.find(item => item.main === subCategories[i]);
        //                     let subOption = {
        //                         label: "  " + subCategory.main,
        //                     };
        //                     let subCategoryOptions = [];
        //                     const revealCategories = subCategory.sub;
        //                     for(let i = 0; i < revealCategories.length; i += 1){
        //                         subCategoryOptions.push({
        //                             label: "    " + revealCategories[i],
        //                             value: {id: i, reveal: revealCategories[i], content: subCategory.main, main: category.main},
        //                         });
        //                     }
        //                     subOption.options = subCategoryOptions;
        //                     options.push(subOption);
        //                 }
        //             } else {
        //                 for(let i = 0; i < subCategories.length; i += 1){
        //                     option.options.push({
        //                         label: subCategories[i],
        //                         value: {id: i, content: subCategories[i], main: category.main},
        //                     });
        //                 }
        //                 options.push(option);
        //             }
        //         });
        //     }
        //     this.setState({
        //         categoryOptions: options,
        //         categories: categories
        //     })
        // });

        getCategories()
        .then(({result: {data}}) => {
            const { categories } = data;
            
            let options = [];
            if(categories.length > 0){
                categories.filter(item=>item.deep === 1).map((category) => {
                    let option = {
                        label: category.main,
                        options: [],
                    };
                    const subCategories = category.sub;
                    const middleSubs = category.sub.filter((el) => categories.find((e) => e.main === el));
                    
                    if (middleSubs.length > 0) {
                        
                        for (let i = 0; i < subCategories.length; i += 1) {
                            const subCategory = categories.find(item => item.main === subCategories[i]);
                            let subOptions = [];
                            let subOptionLabel = category.main + " - " + subCategory.main;

                            const revealCategories = subCategory.sub;

                            for(let j = 0; j < revealCategories.length; j += 1){
                               
                                subOptions.push({
                                    label: revealCategories[j],
                                    value: {id: j, content: revealCategories[j], main: subOptionLabel},
                                });
                            }

                            options.push({
                                label: subOptionLabel,
                                options: subOptions
                            });
                        }
                        
                        
                    } else {
                        for(let i = 0; i < subCategories.length; i += 1){
                            option.options.push({
                                label: subCategories[i],
                                value: {id: i, content: subCategories[i], main: category.main},
                            });
                        }
                        options.push(option);
                    }
                });
            }
            
            this.setState({
                categoryOptions: options
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })

        
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.isOpen !== nextProps.isOpen){
            this.setState({
                isOpen: nextProps.isOpen
            });
        }
    }

    selectCategory(opt) {
        const {selectCategory} = this.props;
        selectCategory({sub: opt.value.content, main: opt.value.main, reveal: opt.value.reveal});
    }

    render() {
        const { handleClose } = this.props;
        const { categoryOptions, isOpen, category } = this.state;

        return (
            <Modal isOpen={isOpen} className="skill-select-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Select Category</h5>
                    {/* <Select
                        className="select-skill"
                        multi
                        styles={customStyles}
                        name="filters"
                        placeholder="Filters"
                        value={category?category.sub:null}
                        options={categoryOptions}
                        onChange={this.selectCategory}
                    /> */}

                    <Select
                        customClassName="select-skill"
                        styles={customStyles}
                        name="filters"
                        placeholder="Select a category"
                        value={category}
                        options={categoryOptions}
                        onChange={this.selectCategory}
                        dark
                    />

                </ModalBody>
            </Modal>
        );
    }
}

SkillSelect.defaultProps = {
    isOpen: false,
};

SkillSelect.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    getCategories: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    selectCategory: PropTypes.func.isRequired
};

export default connect(
    null,
    { ...actions.categories}
)(SkillSelect);
