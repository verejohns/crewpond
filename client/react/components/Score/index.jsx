import React, { Component } from "react";
import PropTypes from "prop-types";

class Score extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rating: null,
            temp_rating: null
        }
    }

    componentDidMount() {
        const {score} = this.props;
        this.setState({
            rating: score || null,
            temp_rating: null
        })
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.rating !== nextProps.score) {
            this.setState({
                rating: nextProps.score || null,
                temp_rating: null
            })
        }
    }
     
    rate(rating) {
        const {disabled, onConfirmRate} = this.props;
        if(!disabled){
            this.setState({
                rating: rating,
                temp_rating: rating
            });
            onConfirmRate(rating);
        }
    }
    
    star_over(rating) {
        this.state.temp_rating = this.state.rating;
        this.state.rating = rating;
        const {disabled} = this.props;
        if(!disabled){
            this.setState({
                rating: this.state.rating,
                temp_rating: this.state.temp_rating
            });    
        }
    }
     
    star_out() {
        this.state.rating = this.state.temp_rating;
        
        const {disabled} = this.props;
        if(!disabled)
            this.setState({ rating: this.state.rating });
    }
    
    render() {
        var stars = [];
        const {size, selectedColor, unSelectedColor, canHover} = this.props;
        for(var i = 0; i < 5; i++) {
          var klass = 'star-rating__star';
          
          if (this.state.rating >= i && this.state.rating != null) {
            klass += ' is-selected';
          }

          if (!canHover) {
            klass += ' is-disabled';
          }
    
          stars.push(
            <label
              className={klass}
              style={{fontSize: size, color: (this.state.rating >= i && this.state.rating != null)?selectedColor:unSelectedColor}}
              onClick={this.rate.bind(this, i)}
              onMouseOver={this.star_over.bind(this, i)}
              onMouseOut={this.star_out.bind(this)}>
              ★
            </label>
          );
        }
        
        return (
          <div className="star-rating">
            {stars}
          </div>
        );
    }
}

Score.defaultProps = {
    disabled: true,
    selectedColor: "#60da8e",
    unSelectedColor: "#ABABAB"
};

Score.propTypes = {
    disabled: PropTypes.bool.isRequired,
    score: PropTypes.number.isRequired,
    selectedColor: PropTypes.string,
    unSelectedColor: PropTypes.string,
    size: PropTypes.string,
    onConfirmRate: PropTypes.func,
    canHover: PropTypes.bool
};

export default Score;
