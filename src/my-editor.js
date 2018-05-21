import React, { Component } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { Segment, Container, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export default class MyEditor extends Component {
    state = {
        editorState: EditorState.createEmpty()
    }

    logState = () => console.log(this.state.editorState.toJS())

    onChange = editorState => this.setState({ editorState })

    handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    render() {
        return (
            <div style={{ marginTop: 15 }}>
                <Container>
                    <Segment>
                        <div style={{ textAlign: 'left' }}>
                            <Editor
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange}
                            editorState={this.state.editorState} />
                        </div>
                    </Segment>
                </Container>
                <div style={{ marginTop: 5 }}>
                    <Button onClick={this.logState}>
                        Log state to console
                    </Button>
                </div>
            </div>
        );
    }
}