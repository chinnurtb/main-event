test:
	npm test

coverage:
	jscoverage --no-highlight lib lib-cov
	EVENT_SERVER_COV=1 mocha --require should --reporter html-cov test/unit/*-tests.js > test/reports/coverage.html
	rm -rf lib-cov

.PHONY: test