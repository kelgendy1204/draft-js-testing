import React from 'react';
import { Segment, Container } from 'semantic-ui-react';
import CustomEditor from './custom-editor';
import SuggestionList from './suggestions';
import styles from './styles';
import { normalizeIndex, filterArray } from './utils';
import * as triggers from './triggers';
import * as data from './data';
import addSuggestion from './addsuggestion';
import 'semantic-ui-css/semantic.min.css';

var filteredArrayTemp;

export default class AutocompleteInput extends React.Component {
    state = {
        autocompleteState: null
    }

    onAutocompleteChange = autocompleteState => {
        this.setState({ autocompleteState });
    }

    onInsert = insertState => {
        alert();
        if (!filteredArrayTemp) {
            return null;
        }
        const index = normalizeIndex(
            insertState.selectedIndex,
            filteredArrayTemp.length
        );
        insertState.text = insertState.trigger + filteredArrayTemp[index];
        return addSuggestion(insertState);
    };

    renderAutocomplete = () => {
        const { autocompleteState } = this.state;
        if (!autocompleteState) {
            return null;
        }
        filteredArrayTemp = this.getFilteredArray(
            autocompleteState.type,
            autocompleteState.text
        );
        autocompleteState.array = filteredArrayTemp;
        autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
        return <SuggestionList suggestionsState={autocompleteState} />;
    }

    getFilteredArray = (type, text) => {
        const dataArray = type === triggers.PERSON ? data.persons : data.tags;
        const filteredArray = filterArray(
            dataArray,
            text.replace(triggers.regExByType(type), '')
        );
        return filteredArray;
    }

    render() {
        return (
            <div style={styles.root}>
                {this.renderAutocomplete()}
                <Container>
                    <Segment>
                        <div style={{ textAlign: 'left' }}>
                            <CustomEditor
                                onAutocompleteChange={this.onAutocompleteChange}
                                onInsert={this.onInsert} />
                        </div>
                    </Segment>
                </Container>
            </div>
        );
    }
}
