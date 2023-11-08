import styled from '@emotion/styled'

export
const Layout = ({ title, children }) => {
  // 主题色
  // 语言
  return <Page>
    <Header>
      <h1>{title}</h1>
      <div>
        <Option>
          <a href = 'https://ppz.xn--6qq986b3xl/' target = '_blank'>微信群</a>
        </Option>
        <Option>
          <a href = 'https://github.com/ppz-pro/file-bridge' target = '_blank'>Github</a>
        </Option>
      </div>
    </Header>
    {children}
  </Page>
}

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Option = styled.div`
  display: inline-block;
  margin-left: 1rem;
  & > * {
    dispay: block;
  }
`
