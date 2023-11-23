import styled from '@emotion/styled'

export
const Switch = ({ value, set_value }) =>
  <Input
    type='checkbox'
    checked={value}
    onChange={() => set_value(!value)}
  />

const Input = styled.input`
  display: inline-block;
  height: 2em;
  width: 3.2em;
  position: relative;
  visibility: hidden;
  &::before, &::after {
    content: '';
    display: block;
    position: absolute;
    visibility: visible;
  }
  &::before {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 1em;
    background: #eee;
  }
  &:checked::before {
    background: #28a745;
  }

  &::after {
    left: 2px;
    width: calc(2em - 4px);
    top: 2px;
    bottom: 2px;
    background: #fff;
    border-radius: calc(1em - 2px);
    transition: .18s transform;
  }
  &:checked::after {
    transform: translateX(1.2em);
  }
`
