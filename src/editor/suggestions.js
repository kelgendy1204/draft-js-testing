import styles from './styles';
import React, { Component } from 'react';
import { normalizeIndex } from './utils';
import PropTypes from 'prop-types';

class SuggestionList extends Component {
    static propTypes = {
        suggestionsState: PropTypes.object
    }

    render() {
        const { suggestionsState } = this.props;
        const { left, top, array, selectedIndex } = suggestionsState;
        const style = {
            ...styles.suggestions,
            ...{
                position: 'absolute',
                left,
                top
            }
        };

        if (!array) {
            return null;
        }

        const normalizedIndex = normalizeIndex(selectedIndex, array.length);
        return (
            <ul style={style}>
                {array.map((person, index) => {
                    const style = index === normalizedIndex ? styles.selectedPerson : styles.person;
                    return (<li key={person} style={style}>{person}</li>);
                })}
            </ul>
        );
    }
}

export default SuggestionList;