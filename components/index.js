import Version from './Version.js'
import Data from './Data.js'
import render from './renderer.js'
import Cfg from './Cfg.js'
import Common from './Common.js'
const Path = process.cwd()
// eslint-disable-next-line camelcase
const Plugin_Name = 'signIn-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`
export { render, Cfg, Common, Data, Version, Path, Plugin_Name, Plugin_Path }
