/*
 * Reference:
 * https://stackoverflow.com/a/48874424/7094502
 */

import { styled } from '@mui/system';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const PlainLink = styled(Link)(({ theme }) => ({
  textDecoration: 'inherit',
  color: 'inherit',
}));

export default (props) => <PlainLink {...props} />;