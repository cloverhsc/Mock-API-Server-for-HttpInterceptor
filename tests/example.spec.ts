import { chromium } from 'playwright';

describe('GET /api/test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('should return a JSON response with a message', async () => {
    await page.goto('http://localhost:3000/api/test');
    const response = await page.waitForResponse(response => response.url() === 'http://localhost:3000/api/test');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ result: 'Hello World!' });
  });

  it('should log the Authorization header of the request', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await page.goto('http://localhost:3000/api/test', { headers: { Authorization: 'Bearer mytoken' } });
    expect(consoleSpy).toHaveBeenCalledWith('Bearer mytoken');
    consoleSpy.mockRestore();
  });
});