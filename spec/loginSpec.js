var selenium = require('selenium-webdriver');

describe("login", function() {

	beforeEach(function (done) {
		this.driver = new selenium.Builder()
		.withCapabilities(selenium.Capabilities.chrome())
		.build();
		this.driver.get('http://localhost:3000/').then(done);
	});

	afterEach(function (done) {
		this.driver.quit().then(done);
	});

	it('on login page', function (done) {
		var userName = this.driver.findElement(selenium.By.className("usernameForm"));
		userName.sendKeys("test");
		var password = this.driver.findElement(selenium.By.className("passwordForm"));
		password.sendKeys("test");
		var signIn = this.driver.findElement(selenium.By.className("signinButton"));
		signIn.click();
		this.driver.getCurrentUrl().then(function(url) {
			expect(url).toContain("/scheduling");
			done();
		});
	});
});