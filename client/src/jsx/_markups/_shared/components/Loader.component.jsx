import light_loader from "../asset/image/loader/light-loader.gif";
import styled from "styled-components";
const StyledLoader = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  img{
    width: 20px;
    height: 20px;
    margin: 0 auto;
  }
`;

function Loader() {
  return (
    <StyledLoader>
      <img src={light_loader} alt="" />
    </StyledLoader>
  );
}

export default Loader;
