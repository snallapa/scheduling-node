var selenium = require('selenium-webdriver');
var By = selenium.By;
var until = selenium.until;
describe("scheduling", function() {

	beforeEach(function (done) {
		this.driver = new selenium.Builder()
		.withCapabilities(selenium.Capabilities.chrome())
		.build();
		this.driver.get('http://localhost:3000/');
		var userName = this.driver.findElement(By.className("usernameForm"));
		userName.sendKeys("test");
		var password = this.driver.findElement(By.className("passwordForm"));
		password.sendKeys("test");
		var signIn = this.driver.findElement(By.className("signinButton"));
		signIn.click();
		this.driver.getCurrentUrl();
		this.driver.wait(until.elementLocated(By.className('itemData')), 10000);
		done();

	});

	afterEach(function (done) {
		var signOut = this.driver.findElement(By.className("signOut"));
		signOut.click();
		this.driver.quit().then(done);
	});

	it('add and remove participant', function (done) {
		var driver = this.driver
		var addLink = driver.findElement(By.className("addLink"));
		addLink.click();
		var input = driver.findElement(By.id("name"));
		driver.wait(until.elementIsVisible(input), 10000);
		input.sendKeys("aa test name");
		var addParticipant = driver.findElement(By.className("addParticipantButton"));
		addParticipant.click();
		var list = driver.findElement(By.className("listView"));
		var currentItem = list.findElement(By.className("active"));
		currentItem.getAttribute("textContent").then(function (text) {
			expect(text).toContain("aa test name");
			driver.executeScript("$('.removeAction').click()");
			var actuallyRemove = driver.findElement(By.className("actuallyRemoveParticipant"));
			driver.wait(until.elementIsVisible(actuallyRemove));
			actuallyRemove.click();
			done();
		});
	});
});