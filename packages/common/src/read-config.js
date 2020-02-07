import { exists } from 'fs-extra'
import { join } from 'path'
import slugify from '@sindresorhus/slugify'
import { constants } from './constants'

const defaultConfig = {
  apiVersion: constants.apiVersion,
  name: constants.packageJson.defaultPluginName,
  id: constants.packageJson.defaultPluginId,
  command: 'index.js'
}

export async function readConfig () {
  const packageJsonPath = join(process.cwd(), 'package.json')
  if ((await exists(packageJsonPath)) === false) {
    return defaultConfig
  }
  const packageJson = require(packageJsonPath)
  const config = packageJson[constants.packageJson.configKey]
  if (typeof config === 'undefined' || Object.keys(config).length === 0) {
    return defaultConfig
  }
  return {
    ...createMenuItem(config),
    apiVersion:
      typeof config.apiVersion !== 'undefined'
        ? config.apiVersion
        : constants.apiVersion,
    id: typeof config.id === 'undefined' ? slugify(config.name) : config.id
  }
}

function createMenuItem (config) {
  const result = {}
  result.name = config.name
  if (typeof config.command !== 'undefined') {
    const id =
      typeof config.command === 'string'
        ? `${config.command}--default`
        : `${config.command.src}--${config.command.handler}`
    result.id = id
    result.command =
      typeof config.command === 'string'
        ? { src: config.command, handler: 'default' }
        : config.command
    if (typeof config.ui !== 'undefined') {
      result.ui =
        typeof config.ui === 'string'
          ? { src: config.ui, handler: 'default' }
          : config.ui
    }
  }
  if (typeof config.menu !== 'undefined') {
    result.menu = normaliseMenu(config.menu)
  }
  return result
}

function normaliseMenu (menu) {
  const result = []
  menu.forEach(function (item) {
    if (item === '-') {
      result.push({ separator: true })
      return
    }
    if (typeof item !== 'undefined') {
      result.push(createMenuItem(item))
    }
  })
  return result
}
