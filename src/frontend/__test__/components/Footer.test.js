import React from 'react';
import { mount } from 'enzyme';
import Footer from '../../components/Footer';

// esto es para hacer suits para los test
describe('<Footer />', () => {
  // usamos mount, para montar nuestro componente
  const footer = mount(<Footer />);

  // para hacar los test
  test('Render Footer Component', () => {
    // vemos si tienen un nodo, que existe
    expect(footer.length).toEqual(1);
  });

  // para hacer los test
  test('Footer haves 3 anchors', () => {
    expect(footer.find('a')).toHaveLength(3);
  });

});
