import styled from "styled-components";

export const FlexContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: start;
    @media (max-width: 768px) {
      & {
        flex-direction: column;
        align-items: center;
      }
    }
`;

export const Column = styled.div`
    flex: 1;
    &.flex-rows {
        display: flex;
        flex-direction: column;
        align-items: center;
        & > * {
            @media (max-width: 1200px) {
              & {
                width: 80%;
              }
            }
            @media (max-width: 768px) {
              & {
                width: 90%;
              }
            }
            width: 50%;
        }
    }
`;

export const InputGroup = styled.div`
    margin-bottom: 1rem;
`;

export const Label = styled.label`
    display: block;
    width: 100%;
    text-align: left;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  box-sizing: border-box;
`;