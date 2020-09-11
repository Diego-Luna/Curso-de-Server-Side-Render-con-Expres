import React from 'react';
import { mount } from 'enzyme';
import { create } from 'react-test-renderer';
import Header from '../../components/Header';
import ProviderMock from '../../__mocks__/ProviderMock';

describe('<Header />', () => {
  // prueba de poder montar un comoponente, y asegurarnos que tenga un objeto
  test('Header logo image', () => {
    const header = mount(
      <ProviderMock>
        <Header />
      </ProviderMock>,
    );

    // con .find(), es para poder buscar un alentdo del componente,
    // en este caso una clase de css
    expect(header.find('.header__img')).toHaveLength(1);

  });

  // para hacer el Snapshots
  test('Header Snapshots', () => {
    const header = create(
      <ProviderMock>
        <Header />
      </ProviderMock>,
    );

    expect(header.toJSON()).toMatchSnapshot();

  });

});
