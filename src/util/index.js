'use strict';
const fs = require('fs');
const chalk = require(`chalk`)
/**
 * Create structure of markdown documentation
 * @param {object} docJson 
 * @return {string} structure of markdown
 */
function createStructureOfMarkdown(docJson){
    let markdown = ''

    markdown += `# ${docJson.info.name}\n`
    markdown += docJson.info.description !== undefined ? `${docJson.info.description || ''}\n` :`\n`
    markdown += readItems(docJson.item)

    return markdown
}

/**
 * Read auth of each method
 * @param {object} auth 
 */
function readAuthorization(auth){
    let markdown = ''
    if(auth){
        markdown += `### Authentication ${auth.type}\n`
        if(auth.bearer){
            markdown += `\n`
            markdown += `|Param|Value|Type|\n`
            markdown += `|---|---|---|\n`
            auth.bearer.map(auth =>{
                markdown += `|${auth.key}|{% raw %}${auth.value}{% endraw %}|${auth.type}|\n`
            })
        }
        markdown += `\n`
    }

    return markdown
}

/**
 * Read request of each method
 * @param {object} request information
 * @return {string} info of data about request options
 */
function readRequestOptions(request){
    let markdown = ''
    if(request){
            request.header.map(header =>{
            markdown += `### Headers\n`
            markdown += `\n`
            markdown += `|Content-Type|Value|Type\n`
            markdown += `|---|---|---|\n`
            markdown += `|${header.key}|{% raw %}${header.value}{% endraw %}|${header.type}|\n`
            markdown += `\n`
        })
    }
    return markdown
}

function readQueryParams(url){
    let markdown = ''
    if(url?.query){
        markdown += `### Query Params\n`
        markdown += `\n`
        markdown += `|Param|Value|Description|\n`
        markdown += `|---|---|---|\n`
        url.query.map(query =>{
            markdown += `|${query.key}|{% raw %}${query.value}{% endraw %}|${query.description || ''}|\n`
        })
        markdown += `\n`
    }

    return markdown
}

/**
 * Read objects of each method
 * @param {object} body 
 */
function readFormDataBody(body) {
    let markdown = ''
    
    if(body){
        if(body.mode === 'raw'){
            markdown += `### Body (**${body.mode}**)\n`
            markdown += `{% highlight json %}{% raw %}\n`
            markdown += `${body.raw}\n`
            markdown += `{% endraw %}{% endhighlight %}\n`
            markdown += `\n`
        }

        if(body.mode === 'formdata') {
            markdown += `### Body (**${body.mode}**)\n`
            markdown += `\n`
            markdown += `|Param|Value|Type|\n`
            markdown += `|---|---|---|\n`
            body.formdata.map(form =>{
                markdown += `|${form.key}|{% raw %}${form.type === 'file' ? form.src : form.value !== undefined ? form.value.replace(/\\n/g,'') : '' }{% endraw %}|${form.type}|\n`
            })
            markdown += `\n`
        }

        if(body.mode === 'urlencoded'){
            markdown += `### Body (**${body.mode}**)\n`
            markdown += `\n`
            markdown += `|Param|Value|Description|Type|\n`
            markdown += `|---|---|---|---|\n`
            body.urlencoded.map(item =>{
                markdown += `|${item.key}|{% raw %}${item.value}{% endraw %}|${item.description}|${item.type}|\n`
            })
            markdown += `\n`
        }
    }

    return markdown 
}

/**
 * Read methods of response
 * @param {array} responses 
 */
function readResponse(responses) {
    let markdown = ''
    markdown += `#### Examples\n\n`
    if (responses?.length) {
        responses.forEach(response => {
            markdown += `##### ${response.name}\n\n`
            if (response.originalRequest) {
                markdown += `###### Request\n`
                markdown += `{% raw %}\n`
                markdown += `\t ${response.originalRequest?.method} ${response.originalRequest?.url?.raw}\n`
                markdown += `{% endraw %}\n`
            }
            markdown += `###### Response\n`
            if (response.code) {
                markdown += `*${response.code} - ${response.status}*\n`
            }
            if (response.body) {
                markdown += `{% highlight json %}{% raw %}\n`
                markdown += `${response.body}\n`
                markdown += `{% endraw %}{% endhighlight %}\n`
            } else {
                markdown += `\n`
                markdown += `No response body\n`
            }
            markdown += `\n`
        });
    }
    return markdown;
}

/**
 * Read methods of each item
 * @param {object} post 
 */
function readMethods(method){
    let markdown = ''
    markdown += method?.request?.description !== undefined ? `${method?.request?.description || ''}\n\n` :`\n`
    markdown += `##### Method: ${method?.request?.method}\n`
    markdown += `{% raw %}\n`
    markdown += `\t${method?.request?.url?.raw}\n`
    markdown += `{% endraw %}\n\n`
    markdown += readRequestOptions(method?.request)
    markdown += readFormDataBody(method?.request?.body)
    markdown += readQueryParams(method?.request?.url)
    markdown += readAuthorization(method?.request?.auth)
    markdown += readResponse(method?.response)
    markdown += `-------------------------------------------\n`
    markdown += `\n`
    return markdown
}

/**
 * Read items of json postman
 * @param {Array} items
 */
function readItems(items, folderDeep = 1) {
    let markdown = ''
    items.forEach(item => { 
        markdown += `${'#'.repeat(folderDeep)} ${item.name} \n\n`
        markdown += item.description !== undefined ? `${item.description || ''}\n`: ``
        markdown += `\n`
        if (item.item) {
            markdown += readItems(item.item, folderDeep + 1)
        } else {
            markdown += readMethods(item)
        }
    })
    
    return markdown
}

/**
 * Create file
 * @param {string} content 
 */
function writeFile(content, fileName){
    fs.writeFile(`${fileName}.md`, content, function (err) {
        if (err) throw err;
        console.log(chalk.green(`Documentation was created correctly ${fileName}.md`))
    });
}

module.exports = {
    createStructureOfMarkdown,
    writeFile
}