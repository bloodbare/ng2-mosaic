import { NewMosaicPage } from './app.po';

describe('new-mosaic App', function() {
  let page: NewMosaicPage;

  beforeEach(() => {
    page = new NewMosaicPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
