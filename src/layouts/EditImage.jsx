import React, { Component } from 'react';
// import { Link } from "react-router-dom";
import axios from 'axios';
import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';

export default class EditImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      sha: null,
    };
  }

  async componentDidMount() {
    try {
      const { match } = this.props;
      const { siteName, fileName } = match.params;
      const resp = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/sites/${siteName}/images/${fileName}`, {
        withCredentials: true,
      });
      const { content, sha } = resp.data;
      this.setState({ content, sha });
    } catch (err) {
      console.log(err);
    }
  }

  createPage = async () => {
    try {
      const { match } = this.props;
      const { siteName, fileName } = match.params;
      const base64Content = Base64.encode((this.contentBox).innerHTML);
      const params = {
        imageName: fileName,
        content: base64Content,
      };
      const resp = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/sites/${siteName}/images`, params, {
        withCredentials: true,
      });
      const { content, sha } = resp.data;
      this.setState({ content, sha });
    } catch (err) {
      console.log(err);
    }
  }

  updatePage = async () => {
    try {
      const { match } = this.props;
      const { siteName, fileName } = match.params;
      const { state } = this;
      const base64Content = Base64.encode((this.contentBox).innerHTML);
      const params = {
        content: base64Content,
        sha: state.sha,
      };
      const resp = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/sites/${siteName}/images/${fileName}`, params, {
        withCredentials: true,
      });
      const { content, sha } = resp.data;
      this.setState({ content, sha });
    } catch (err) {
      console.log(err);
    }
  }

  deletePage = async () => {
    try {
      const { match } = this.props;
      const { siteName, fileName } = match.params;
      const { state } = this;
      const params = {
        sha: state.sha,
      };
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/sites/${siteName}/images/${fileName}`, {
        data: params,
        withCredentials: true,
      });
    } catch (err) {
      console.log(err);
    }
  }

  renamePage = async () => {
    try {
      const { match } = this.props;
      const { siteName, fileName } = match.params;
      const { state } = this;
      const newFileName = (this.newFileName).value;
      const params = {
        content: state.content,
        sha: state.sha,
      };
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/sites/${siteName}/images/${fileName}/rename/${newFileName}`, params, {
        withCredentials: true,
      });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { content, sha } = this.state;
    const { match } = this.props;
    const { fileName } = match.params;
    return (
      <>
        <h3>
          Editing image
          {' '}
          {fileName}
        </h3>
        { sha
          ? (
            <>
              <img alt="" src={`data:image/svg+xml;base64,${content}`} />
              <img alt="" src={`data:image/png;base64,${content}`} />
            </>
          )
          : (
            <p>No Images loaded</p>
          )}
        <button type="button" onClick={sha ? this.updatePage : this.createPage}>Save</button>
        <br />
        <br />
        <button type="button" onClick={this.deletePage}>Delete</button>
        <br />
        <br />
        <input placeholder="New file name" ref={(node) => { this.newFileName = node; }} />
        <button type="button" onClick={this.renamePage}>Rename</button>
      </>
    );
  }
}

EditImage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      siteName: PropTypes.string,
      fileName: PropTypes.string,
      newFileName: PropTypes.string,
    }),
  }).isRequired,
};
