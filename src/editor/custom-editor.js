import React, { Component } from 'react';
import { Editor, EditorState } from 'draft-js';
import styles from './styles';
import PropTypes from 'prop-types';
import * as triggers from './triggers';

export default class CustomEditor extends Component {
    static propTypes = {
        onAutocompleteChange: PropTypes.func,
        onUpArrow: PropTypes.func,
        onDownArrow: PropTypes.func,
        onEscape: PropTypes.func,
        onInsert: PropTypes.func
    }

    state = {
        editorState: EditorState.createEmpty()
    }

    onEditorState = editorState => this.setState({ editorState });

    autocompleteState = null;

    onChange = editorState => {
        const { onAutocompleteChange } = this.props;
        this.onEditorState(editorState);
        if (onAutocompleteChange) {
            window.requestAnimationFrame(() => {
                onAutocompleteChange(this.getAutocompleteState());
            });
        }
    }

    onArrow = (e, originalHandler, nudgeAmount) => {
        const { onAutocompleteChange } = this.props;
        let autocompleteState = this.getAutocompleteState(false);
        if (!autocompleteState) {
            if (originalHandler) {
                originalHandler(e);
            }
            return;
        }

        e.preventDefault();
        autocompleteState.selectedIndex += nudgeAmount;
        this.autocompleteState = autocompleteState;
        if (onAutocompleteChange) {
            onAutocompleteChange(autocompleteState);
        }
    }

    onUpArrow = e => {
        this.onArrow(e, this.props.onUpArrow, -1);
    }

    onDownArrow = e => {
        this.onArrow(e, this.props.onDownArrow, 1);
    }

    onEscape = e => {
        const { onEscape, onAutocompleteChange } = this.props;

        if (!this.getAutocompleteState(false)) {
            if (onEscape) {
                onEscape(e);
            }
            return;
        }

        e.preventDefault();
        this.autocompleteState = null;

        if (onAutocompleteChange) {
            onAutocompleteChange(null);
        }
    }

    onTab = e => {
        this.commitSelection(e);
    }

    handleReturn = e => {
        return this.commitSelection(e);
    }

    commitSelection = e => {
        const { onAutocompleteChange } = this.props;
        let autocompleteState = this.getAutocompleteState(false);
        if (!autocompleteState) {
            return false;
        }
        e.preventDefault();
        this.onMentionSelect();
        this.autocompleteState = null;

        if (onAutocompleteChange) {
            onAutocompleteChange(null);
        }
        return true;
    }

    onMentionSelect = () => {
        let autocompleteState = this.getAutocompleteState(false);
        const insertState = this.getInsertState(
            autocompleteState.selectedIndex,
            autocompleteState.trigger
        );
        const { onInsert } = this.props;
        const newEditorState = onInsert(insertState);
        this.onEditorState(newEditorState);
    }

    getInsertState = (selectedIndex, trigger) => {
        const { editorState } = this.state;
        const currentSelectionState = editorState.getSelection();
        const end = currentSelectionState.getAnchorOffset();
        const anchorKey = currentSelectionState.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(anchorKey);
        const blockText = currentBlock.getText();
        const start = blockText.substring(0, end).lastIndexOf(trigger);
        return {
            editorState,
            start,
            end,
            trigger,
            selectedIndex
        };
    }

    hasEntityAtSelection = () => {
        const { editorState } = this.state;

        const selection = editorState.getSelection();
        if (!selection.getHasFocus()) {
            return false;
        }

        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selection.getStartKey());
        return !!block.getEntityAt(selection.getStartOffset() - 1);
    }

    getAutocompleteRange = trigger => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return null;
        }

        if (this.hasEntityAtSelection()) {
            return null;
        }

        const range = selection.getRangeAt(0);
        let text = range.startContainer.textContent;
        text = text.substring(0, range.startOffset);
        const index = text.lastIndexOf(trigger);
        if (index === -1) {
            return null;
        }
        text = text.substring(index);
        return {
            text,
            start: index,
            end: range.startOffset
        };
    }

    getAutocompleteState = (invalidate = true) => {
        if (!invalidate) {
            return this.autocompleteState;
        }

        var type = null;
        var trigger = null;
        const tagRange = this.getAutocompleteRange(triggers.TAG_TRIGGER);
        const personRange = this.getAutocompleteRange(triggers.PERSON_TRIGGER);
        if (!tagRange && !personRange) {
            this.autocompleteState = null;
            return null;
        }
        var range = null;
        if (!tagRange) {
            range = personRange;
            type = triggers.PERSON;
            trigger = triggers.PERSON_TRIGGER;
        }

        if (!personRange) {
            range = tagRange;
            type = triggers.TAG;
            trigger = triggers.TAG_TRIGGER;
        }

        if (!range) {
            range = tagRange.start > personRange.start ? tagRange : personRange;
            type =
                tagRange.start > personRange.start
                    ? triggers.TAG
                    : triggers.PERSON;
            trigger =
                tagRange.start > personRange.start
                    ? triggers.TAG_TRIGGER
                    : triggers.PERSON_TRIGGER;
        }

        const tempRange = window
            .getSelection()
            .getRangeAt(0)
            .cloneRange();
        tempRange.setStart(tempRange.startContainer, range.start);

        const rangeRect = tempRange.getBoundingClientRect();
        let [left, top] = [rangeRect.left, rangeRect.bottom];

        this.autocompleteState = {
            trigger,
            type,
            left,
            top,
            text: range.text,
            selectedIndex: 0
        };
        return this.autocompleteState;
    }

    render() {
        const { editorState } = this.state;

        return (
            <Editor
                customStyleMap={styles}
                editorState={editorState}
                handleReturn={this.handleReturn}
                onChange={this.onChange}
                onEscape={this.onEscape}
                onUpArrow={this.onUpArrow}
                onDownArrow={this.onDownArrow}
                onTab={this.onTab}
            />
        );
    }
}
