GENERATOR := ag

docs: asyncapi.yaml
	${GENERATOR} $< @asyncapi/nodejs-template -o $@
