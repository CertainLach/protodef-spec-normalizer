# protodef-spec-normalizer
Traverses and flattens protodef spec json

# Cases handled
- switch.fields[n]->any
- option.optional->any
- container.fields[n]->any except mapper, switch (he refers a container fields by name), count and array with countField
- array.type->any

# Examples
See test dir => input.json->output.json