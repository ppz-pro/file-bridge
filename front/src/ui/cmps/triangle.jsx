import styled from '@emotion/styled'

export
const Triangle = styled.div`
  display: inline-block;
  &::before {
    box-sizing: border-box;
    display: block;
    content: '';
    width: 1em;
    height: 1em;
    border-left: .5em solid transparent;
    border-right: .5em solid transparent;
    border-top: .32em solid transparent;
    border-bottom: .68em solid currentColor;
    transform: translateY(-.16em);
  }
`
